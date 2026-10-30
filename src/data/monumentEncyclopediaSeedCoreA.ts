export interface MonumentScholarlySeed {
  id: string;
  coordinatesLabel: string;
  elevationMeters: number;
  riverBasin: string;
  primaryStonePetrology: string;
  architecturalOrder: string;
  structuralDimensions: string;
  excavationChronology: string;
  epigraphicCorpus: string;
  dynasticSequence: string;
  tradeAndGuildNetwork: string;
  sacredCalendarAndFestivals: string;
  conservationMilestones: string;
  odiaHistorySummary: string;
  odiaLegendSummary: string;
  odiaArchitectureSummary: string;
  hindiHistorySummary: string;
  hindiLegendSummary: string;
  hindiArchitectureSummary: string;
}

export const CORE_MONUMENT_SEEDS_A: Record<string, MonumentScholarlySeed> = {
  'story-konark': {
    id: 'story-konark',
    coordinatesLabel: '19.8876° N, 86.0945° E (Chandrabhaga Littoral Dune Belt)',
    elevationMeters: 12,
    riverBasin: 'Ancient Chandrabhaga Paleochannel & Kushabhadra Coastal Delta',
    primaryStonePetrology:
      'Garnetiferous-sillimanite Khondalite (superstructure), dark fine-grained Muguni Chlorite schist from Nilagiri/Mayurbhanj (sanctum doorframes, 3 colossal Surya icons, Aruna Stambha), and ferruginous Laterite (subterranean plinth, enclosure foundation, and drainage aprons)',
    architecturalOrder:
      'Mature Panchanana Kalinga Saptaratha Rekha Deula (collapsed c. 1848) paired with Pancharatha Three-Tiered Pidha Jagamohana (39m intact) and Detached Pillared Natamandira atop a 4-meter Upana-Pitha Solar Chariot',
    structuralDimensions:
      'Original Rekha Vimana estimated 227–229 ft (69.5 m); surviving Pidha Jagamohana 128 ft (39 m); 24 chariot wheels each 9 ft 9 in (2.97 m) diameter with 8 major + 8 minor spokes; wrought-iron ceiling girders up to 35 ft long weighing 5.6 tonnes forged by forge-welding blooms',
    excavationChronology:
      'Surveyed by Andrew Stirling (1822), James Fergusson (1837 sketch of surviving Rekha wall stub), Rajendralala Mitra (1868), sand-clearance & interior masonry sealing by T. Bloch and Bishan Swarup (1901–1910), UNESCO World Heritage inscription #246 (1984), CBRI Roorkee 3D laser-endoscopic Jagamohana vault scan (2014–2022)',
    epigraphicCorpus:
      'Kendupatna Copper Plates (Sets I–III, Saka 1217 / 1295 CE), Asankhali Copper Plate (1302 CE), Punjabi Matha & Sankarananda Matha Copper Grants of Narasimhadeva II praising Narasimhadeva I erecting a mahakutira for Ushnarashmi (Surya) at Konakona; Baya Chakada palm-leaf building ledgers',
    dynasticSequence:
      'Imperial Eastern Ganga Sovereign Langula Narasimhadeva I (r. 1238–1264 CE), assisted by Minister Sadasiva Guru and Commander-in-Chief Sivananda; subsequent Suryavamsi Gajapati maintenance until 1568 CE Bengal Sultanate raid; Maratha removal of Aruna Stambha to Puri Singhadwara by Brahmachari Gosain (c. 1779 CE)',
    tradeAndGuildNetwork:
      'Twelve hundred Silpis organized under Sutradhara Bisu Maharana, Sadashiva Samantaraya, and Gadadhara Mahapatra; riverine stone barges floating massive blocks via Prachi-Kushabhadra-Mahanadi canals during monsoon high water; maritime navigational landmark (Black Pagoda) on Dutch, Portuguese, and English Admiralty charts',
    sacredCalendarAndFestivals:
      'Magha Saptami (Chandrabhaga Mela—hundreds of thousands take pre-dawn holy dip greeting rising Surya), Konark Classical Dance Festival (December 1–5 in open-air auditorium), Samba Dashami solar worship across Odisha households',
    conservationMilestones:
      '1901 Sir John Woodburn conservation directive; 1903–1904 hydraulic sand-filling and dry-stone plugging of four Jagamohana portals by T. Bloch; paper-pulp soluble desalination treatment against marine chloride aerosol; Casuarina coastal windbreak belt reducing sand-blast abrasion',
    odiaHistorySummary:
      'ତ୍ରୟୋଦଶ ଶତାବ୍ଦୀରେ (୧୨୩୮–୧୨୬୪ ଖ୍ରୀଷ୍ଟାବ୍ଦ) ପୂର୍ବ ଗଙ୍ଗ ବଂଶର ପ୍ରତାପୀ ସମ୍ରାଟ ପ୍ରଥମ ଲାଙ୍ଗୁଳା ନରସିଂହଦେବ ବଙ୍ଗ ବିଜୟ ସ୍ମୃତିରେ ଚନ୍ଦ୍ରଭାଗା ତଟରେ ବିଶ୍ୱବିଖ୍ୟାତ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ନିର୍ମାଣ କରିଥିଲେ। ମୁଖ୍ୟ ସ୍ଥପତି ବିଶୁ ମହାରଣାଙ୍କ ନେତୃତ୍ୱରେ ୧୨୦୦ ଶିଳ୍ପୀ ୧୨ ବର୍ଷର ରାଜସ୍ୱ ବିନିଯୋଗ କରି ୨୨୭ ଫୁଟ ଉଚ୍ଚ ମୁଖ୍ୟ ଦେଉଳ, ୧୨୮ ଫୁଟର ଜଗମୋହନ ଓ ନାଟମନ୍ଦିର ଗଢ଼ିଥିଲେ। ୧୯୦୧–୧୯୦୪ରେ ଜଗମୋହନର ସୁରକ୍ଷା ପାଇଁ ବ୍ରିଟିଶ ପ୍ରତ୍ନତତ୍ତ୍ୱବିତ୍ ଟି. ବ୍ଲକ୍ ଏହାର ଭିତରେ ବାଲି ଭର୍ତ୍ତି କରି ବନ୍ଦ କରିଥିଲେ ଏବଂ ୧୯୮୪ରେ ଏହା ୟୁନେସ୍କୋ ବିଶ୍ୱ ଐତିହ୍ୟ ମାନ୍ୟତା ପାଇଲା।',
    odiaLegendSummary:
      'ଓଡ଼ିଆ ଲୋକସ୍ମୃତି ଓ ବାୟା ଚକଡ଼ା ଅନୁସାରେ ୧୨୦୦ ବଢ଼େଇ ମନ୍ଦିର ଶିଖରରେ ଚୁମ୍ବକୀୟ ଦଧିନଉତି (କଳସ) ବସାଇ ନପାରିବାରୁ ରାଜା ନରସିଂହଦେବ ସମସ୍ତଙ୍କ ଶିରଚ୍ଛେଦ ଆଦେଶ ଦେଇଥିଲେ। ବିଶୁ ମହାରଣାଙ୍କ ୧୨ ବର୍ଷର ପୁତ୍ର ଧର୍ମପଦ ରାତାରାତି କଳସ ସ୍ଥାପନ କରି ୧୨୦୦ ଶିଳ୍ପୀଙ୍କ ସମ୍ମାନ ଓ ଜୀବନ ରକ୍ଷା ପାଇଁ ଚନ୍ଦ୍ରଭାଗା ସମୁଦ୍ରକୁ ଡେଇଁ ଆତ୍ମବଳି ଦେଇଥିଲେ। ପୌରାଣିକ ଶାମ୍ବ ପୁରାଣ ଅନୁସାରେ ଶ୍ରୀକୃଷ୍ଣଙ୍କ ପୁତ୍ର ଶାମ୍ବ ଏଠାରେ ୧୨ ବର୍ଷ ତପସ୍ୟା କରି କୁଷ୍ଠରୋଗରୁ ମୁକ୍ତି ପାଇ ସୂର୍ଯ୍ୟ ଉପାସନା ଆରମ୍ଭ କରିଥିଲେ।',
    odiaArchitectureSummary:
      'ସାତଟି ଗତିଶୀଳ ଅଶ୍ୱ ଓ ୨୪ଟି ୯ ଫୁଟ ୯ ଇଞ୍ଚ ବ୍ୟାସର ଚକ୍ର ଉପରେ କୋଣାର୍କ ଏକ ବିଶାଳ ସୌର-ରଥ ରୂପେ ନିର୍ମିତ। ପ୍ରତ୍ୟେକ ଚକ୍ରର ୮ଟି ମୋଟା ଓ ୮ଟି ସରୁ ଅର ସଠିକ୍ ସୂର୍ଯ୍ୟଘଣ୍ଟା ଭାବେ ମିନିଟ୍ ହିସାବରେ ସମୟ ନିର୍ଦ୍ଧାରଣ କରେ। ଖଣ୍ଡୋଲାଇଟ୍, କଳା ମୁଗୁନି (କ୍ଲୋରାଇଟ୍) ଓ ମାଙ୍କଡ଼ା ପଥରରେ ନିର୍ମିତ ଏହି ମନ୍ଦିରରେ ବିନା ଚୂନ-ସିମେଣ୍ଟରେ ୩୫ ଫୁଟ ଲମ୍ବା ପିଟା-ଲୁହା ବିମ୍ ଓ ଲୁହା କ୍ଲାମ୍ପ ବ୍ୟବହୃତ ହୋଇଛି।',
    hindiHistorySummary:
      'तेरहवीं शताब्दी (1238–1264 ईस्वी) में पूर्वी गंग साम्राज्य के पराक्रमी सम्राट लांगुला नरसिंहदेव प्रथम ने बंगाल अभियान की ऐतिहासिक विजय के उपलक्ष्य में चंद्रभागा तट पर कोणार्क सूर्य मंदिर का निर्माण कराया। मुख्य वास्तुकार बिशु महाराणा के नेतृत्व में 1,200 कुशल शिल्पकारों ने राज्य के बारह वर्षों के राजस्व से 227 फीट ऊंचे मुख्य विमान, 128 फीट के जगमोहन और भव्य नाटमंदिर की रचना की। 1901–1904 में जगमोहन को ढहने से बचाने के लिए टी. ब्लॉक ने इसमें रेत भरकर सील किया तथा 1984 में यूनेस्को ने इसे विश्व धरोहर घोषित किया।',
    hindiLegendSummary:
      'उड़िया लोकगाथाओं और बाया चकड़ा पांडुलिपि के अनुसार जब 1,200 शिल्पकार मुख्य शिखर पर चुंबकीय कलश स्थापित नहीं कर सके और सम्राट ने मृत्युदंड की चेतावनी दी, तब बिशु महाराणा के 12 वर्षीय प्रतिभाशाली पुत्र धर्मपद ने एक ही रात में कलश स्थापित कर दिया और कारीगर समाज के सम्मान की रक्षा हेतु चंद्रभागा सागर में कूदकर सर्वोच्च बलिदान दिया। सांब पुराण के अनुसार श्रीकृष्ण के पुत्र सांब ने यहीं तपस्या कर कुष्ठ रोग से मुक्ति पाई थी।',
    hindiArchitectureSummary:
      'कोणार्क सूर्य मंदिर सात दौड़ते पाषाण अश्वों और 24 विशाल चक्रों (प्रत्येक 9 फीट 9 इंच व्यास) पर टिके भगवान सूर्य के दिव्य रथ के रूप में निर्मित है। प्रत्येक चक्र की आठ मुख्य और आठ सहायक तीलियां परिशुद्ध खगोलीय धूपघड़ी का कार्य करती हैं। खोंडालाइट, काले क्लोराइट (मुगुनी) और लैटेराइट पत्थरों से बिना चूने-गारे के बने इस मंदिर में 35 फीट लंबे जंग-रोधी लोहे के शहतीर प्रयुक्त हुए हैं।'
  },
  'story-puri-jagannath': {
    id: 'story-puri-jagannath',
    coordinatesLabel: '19.8049° N, 85.8179° E (Nilachala Mound, Bada Danda, Puri)',
    elevationMeters: 16,
    riverBasin: 'Coastal Bhargavi-Daya Alluvial Fan & Mahodadhi (Bay of Bengal) Littoral',
    primaryStonePetrology:
      'Khondalite structural masonry (revealed beneath 40cm lime plaster during 1975–1992 ASI deplastering), black Muguni Chlorite for Ratnavedi and portal jambs, and sacred Neem wood (Azadirachta indica — Daru Brahma) for the Chaturdha Murti',
    architecturalOrder:
      'Four-Chambered Imperial Pancharatha Kalinga Rekha Deula (Vimana, Jagamohana, Natamandira, Bhogamandapa) enclosed within concentric double fortifications: Meghanada Prachira (665 × 640 ft) and Kurma Bedha',
    structuralDimensions:
      '214 ft 8 in (65.4 m) Rekha Vimana crowned by eight-spoked Ashtadhatu Nilachakra (11 ft 8 in height, ~1 tonne); Meghanada Prachira outer wall 20–24 ft high; Rosaghara ritual kitchen housing 240 earthen chulis serving up to 100,000 pilgrims daily',
    excavationChronology:
      'Dasgoba Copper Plates (1198 CE) confirming Anantavarman Chodaganga Deva initiating Srimandira after 1112–1135 CE conquest; completion & ritual codification (Chhatisa Nijoga) by Anangabhima Deva III (1230 CE); ASI Expert Committee lime-deplastering & stainless-steel box-portal reinforcement (1975–2018)',
    epigraphicCorpus:
      'Dasgoba Plates of Rajaraja III; Nagari Plates of Anangabhima Deva III (declaring Odisha the Purushottama Samrajya ruled as Rauta/Deputy of Lord Jagannath); Pataleswara Shrine inscriptions (1225–1237 CE); Jaya-Vijaya doorway Odia proclamation of Gajapati Prataparudra Deva (1499 CE mandating Gita Govinda singing); Madala Panji palm-leaf annals',
    dynasticSequence:
      'Somavamshi early shrine (Yayati I), Imperial Eastern Gangas (Chodaganga Deva r. 1077–1147 CE; Anangabhima Deva III), Suryavamsi Gajapatis (Kapilendra, Purushottama, Prataparudra Deva), Bhoi Dynasty of Khurda (Ramachandra Deva I), Maratha Bhonsles, and Puri Gajapati Maharaj as Adya Sevaka',
    tradeAndGuildNetwork:
      'Thirty-six hereditary ritual guilds (Chhatisa Nijoga) uniting tribal Sabara Daitapatis, Vedic Sasana Brahmins, Suara cooks, Raghurajpur Chitrakaras, and Maharana chariot carpenters building three fresh 2,064-piece timber chariots (Nandighosha, Taladhwaja, Darpadalana) every year',
    sacredCalendarAndFestivals:
      'Ashadha Shukla Dwitiya Ratha Yatra (9-day Gundicha sojourn & Suna Besha), Debasnana Purnima (108-pot ritual bath), 15-day Anavasara, Chandan Yatra (42 days), Kartika Panchuka, and Nabakalebara (every 12 or 19 years with double Ashadha month)',
    conservationMilestones:
      '1975 ASI deplastering uncovering exquisite 12th-century relief sculptures buried under 18 inches of lime; laser alignment & stainless-steel truss stabilization of Jagamohana capitals; Parikrama heritage corridor upgrades',
    odiaHistorySummary:
      'ଦ୍ୱାଦଶ ଶତାବ୍ଦୀରେ ପୂର୍ବ ଗଙ୍ଗ ସମ୍ରାଟ ଅନନ୍ତବର୍ମନ ଚୋଡ଼ଗଙ୍ଗ ଦେବ ପୁରୀର ନୀଳାଚଳ କ୍ଷେତ୍ରରେ ୨୧୪ ଫୁଟ ୮ ଇଞ୍ଚ ଉଚ୍ଚ ଭବ୍ୟ ଶ୍ରୀଜଗନ୍ନାଥ ମନ୍ଦିର ନିର୍ମାଣ ଆରମ୍ଭ କରିଥିଲେ ଏବଂ ଅନଙ୍ଗଭୀମ ଦେବ ତୃତୀୟ ଏହାର ଛତିଶା ନିଯୋଗ ସେବା ଓ ‘ପୁରୁଷୋତ୍ତମ ସାମ୍ରାଜ୍ୟ’ ବିଧାନ ପ୍ରଚଳନ କରିଥିଲେ। ମାଦଳା ପାଞ୍ଜି ଅନୁସାରେ ମନ୍ଦିର ଉପରେ ୧୮ ଥର ବୈଦେଶିକ ଆକ୍ରମଣ ହୋଇଥିଲେ ହେଁ ସାହସୀ ସେବାୟତମାନେ ଚିଲିକା ଦ୍ୱୀପ ଓ ଗଡ଼ଜାତ ପାହାଡ଼ରେ ଦାରୁବ୍ରହ୍ମଙ୍କୁ ଗୁପ୍ତରେ ସୁରକ୍ଷିତ ରଖିଥିଲେ।',
    odiaLegendSummary:
      'ସ୍କନ୍ଦ ପୁରାଣ ଓ ସାରଳା ମହାଭାରତ ଅନୁସାରେ ମହାପ୍ରଭୁ ପ୍ରଥମେ ଶବର ରାଜା ବିଶ୍ୱାବସୁଙ୍କ ଦ୍ୱାରା ନୀଳମାଧବ ରୂପେ ପୂଜା ପାଉଥିଲେ। ମାଳବ ରାଜା ଇନ୍ଦ୍ରଦ୍ୟୁମ୍ନ, ରାଣୀ ଗୁଣ୍ଡିଚା ଓ ବିଦ୍ୟାପତିଙ୍କ ଭକ୍ତିରେ ପ୍ରସନ୍ନ ହୋଇ ସମୁଦ୍ରରେ ଭାସି ଆସିଥିବା ପବିତ୍ର ଦାରୁରୁ ଦେବଶିଳ୍ପୀ ବିଶ୍ୱକର୍ମା ବନ୍ଦ କୋଠରୀ ମଧ୍ୟରେ ଚତୁର୍ଦ୍ଧା ମୂର୍ତ୍ତି ଗଢ଼ିଥିଲେ। ପ୍ରତି ୧୨ ବା ୧୯ ବର୍ଷରେ ଯୋଡ଼ା ଆଷାଢ଼ ପଡ଼ିଲେ ନବକଳେବର ଓ ଗୁପ୍ତ ବ୍ରହ୍ମ ପରିବର୍ତ୍ତନ ଲୀଳା ସମ୍ପନ୍ନ ହୁଏ।',
    odiaArchitectureSummary:
      'ମେଘନାଦ ପ୍ରାଚୀର ଓ କୂର୍ମ ବେଢ଼ା ମଧ୍ୟରେ ଥିବା ଶ୍ରୀମନ୍ଦିର କଳିଙ୍ଗ ପଞ୍ଚରଥ ରେଖା-ଦେଉଳ ଶୈଳୀରେ ବିମାନ, ଜଗମୋହନ, ନାଟମନ୍ଦିର ଓ ଭୋଗମଣ୍ଡପକୁ ନେଇ ଗଠିତ। ଶିଖର ଉପରେ ଅଷ୍ଟଧାତୁର ନୀଳଚକ୍ର ଓ ପତିତପାବନ ବାନା ସଦା ପବନର ବିପରୀତ ଦିଗରେ ଉଡ଼େ। ବିଶ୍ୱର ବୃହତ୍ତମ ରୋଷଘରେ ୨୪୦ଟି ମାଟି ଚୁଲିରେ ଗୋଟିଏ ଉପରେ ଗୋଟିଏ ସାତଟି ମାଟି କୁଡ଼ୁଆ ରଖାଯାଇ ମହାପ୍ରସାଦ ପ୍ରସ୍ତୁତ ହୁଏ।',
    hindiHistorySummary:
      'बारहवीं शताब्दी में पूर्वी गंग सम्राट अनंतवर्मन चोडगंग देव ने नीलाचल धाम पुरी में 214 फीट 8 इंच ऊंचे भव्य श्री जगन्नाथ मंदिर (श्रीमंदिर) का निर्माण प्रारंभ किया तथा अनंगभीम देव तृतीय ने संपूर्ण ओडिशा को भगवान जगन्नाथ का ‘पुरुषोत्तम साम्राज्य’ घोषित कर छत्तीसा नियोग सेवा स्थापित की। मदला पांजी इतिहास के अनुसार 18 विदेशी आक्रमणों के बावजूद वीर सेवायतों ने दारुब्रह्म विग्रहों को चिल्का झील के द्वीपों में सुरक्षित बचाया।',
    hindiLegendSummary:
      'स्कंद पुराण के अनुसार भगवान जगन्नाथ मूलतः आदिवासी शबरराज विश्वावसु द्वारा नीलमाधव रूप में पूजे जाते थे। राजा इंद्रद्युम्न और रानी गुंडिचा की भक्ति से समुद्र में तैरकर आए पवित्र नीम दारु से देवशिल्पी विश्वकर्मा ने बंद कक्ष में चतुर्धा मूर्ति का निर्माण किया। प्रत्येक 12 या 19 वर्ष में अधिक आषाढ़ मास आने पर गुप्त ‘नवकलेवर’ और ब्रह्म-परिवर्तन की अलौकिक लीला संपन्न होती है।',
    hindiArchitectureSummary:
      'विशाल मेघनाद प्राचीर और कूर्म बेढ़ा से घिरा श्रीमंदिर कलिंग पंचरथ रेखा शैली में विमान, जगमोहन, नाटमंदिर और भोगमंडप से युक्त है। शिखर पर अष्टधातु का नीलचक्र सुशोभित है, जिस पर ध्वज सदैव पवन की विपरीत दिशा में लहराता है। मंदिर की विशाल रसोई में 240 मिट्टी के चूल्हों पर सात मिट्टी की हांडियों में छप्पन भोग महाप्रसाद पकता है।'
  },
  'story-dhauli': {
    id: 'story-dhauli',
    coordinatesLabel: '19.7924° N, 85.8394° E (Dhauli / Surabha Hill, Daya River South Bank)',
    elevationMeters: 68,
    riverBasin: 'Daya River Floodplain opposite Sisupalgarh Tosali',
    primaryStonePetrology:
      'Spotted quartzose-feldspathic Khondalite & Charnockitic granite (256 BCE Rock-Cut Forepart of Elephant & Brahmi Edict Panel); reinforced white concrete & stone sculptural reliefs (1972 Shanti Stupa)',
    architecturalOrder:
      'Mauryan Rock-Cut Monolithic Sculpture & Epigraphic Scarp (earliest dated sculpture in Odisha, c. 256 BCE), 7th-century Bhauma-era Dhavaleswar Rekha Shrine, and 20th-century Indo-Japanese Hemispherical Vishwa Shanti Stupa',
    structuralDimensions:
      'Mauryan Rock-Cut Elephant 4 ft (1.22 m) emerging half-length from natural boulder above a 15 × 10 ft smoothed epigraphic panel in three columns; 1972 Shanti Stupa 70+ ft dome crowned by five sacred Chhatra umbrellas',
    excavationChronology:
      'Rediscovered by Lieutenant Markham Kittoe in 1837; first deciphered by James Prinsep in 1838 establishing Ashoka’s identity as Devanampiya Piyadasi; linked archaeologically by B.B. Lal’s 1948 excavation of Sisupalgarh; Shanti Stupa consecrated 8 November 1972',
    epigraphicCorpus:
      'Ashoka’s Major Rock Edicts I–X and XIV plus Separate Kalinga Edicts I & II in Mauryan Brahmi script and Magadhi Prakrit; cave inscription of King Santikara I (829 CE) in Arghyakavarati cave',
    dynasticSequence:
      'Independent Kalinga Ganarajya (defended 261 BCE) -> Mauryan Emperor Devanampiya Ashoka -> Mahameghavahana Chedi reclamation -> Bhauma-Kara monastic patronage (829 CE) -> Kalinga Nippon Buddha Sangha & Nichidatsu Fujii Guruji (1972)',
    tradeAndGuildNetwork:
      'Strategic southern river-crossing of the Uttarapatha–Dakshinapatha imperial highway connecting Tosali (Sisupalgarh) to Tamralipti and Paloura ports',
    sacredCalendarAndFestivals:
      'Kalinga Mahotsav of Martial & Peace Dances (February), Buddha Purnima & Ashoka Vijayadashami Peace Assemblies, Maha Shivaratri at hilltop Dhavaleswar Shiva Temple',
    conservationMilestones:
      'ASI protective stone pavilion erected over the 256 BCE Brahmi Rock Edicts; 1972 Indo-Japanese collaborative construction under Fujii Guruji; evening 3D projection mapping of the Kalinga War transformation',
    odiaHistorySummary:
      'ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ରେ ଦୟା ନଦୀ ପ୍ରାନ୍ତରରେ ସଂଘଟିତ ଐତିହାସିକ କଳିଙ୍ଗ ଯୁଦ୍ଧରେ ଲକ୍ଷାଧିକ ବୀର କଳିଙ୍ଗବାସୀଙ୍କ ବଳିଦାନ ମଗଧ ସମ୍ରାଟ ଚଣ୍ଡାଶୋକଙ୍କ ହୃଦୟକୁ ତରଳାଇ ତାଙ୍କୁ ‘ଧର୍ମାଶୋକ’ରେ ପରିଣତ କରିଥିଲା। ଧଉଳି ପାହାଡ଼ ଗାତ୍ରରେ ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୫୬ରେ ଖୋଦିତ ଅଶୋକଙ୍କ ବ୍ରାହ୍ମୀ ଶିଳାଲେଖ ଓ ଓଡ଼ିଶାର ପ୍ରାଚୀନତମ ପ୍ରସ୍ତର ଭାସ୍କର୍ଯ୍ୟ ‘ଶୈଳ-ହସ୍ତୀ’ ବିଶ୍ୱ ଶାନ୍ତିର ପ୍ରଥମ ଘୋଷଣାପତ୍ର ଅଟେ। ୧୯୭୨ରେ ଜାପାନର ଫୁଜି ଗୁରୁଜୀଙ୍କ ସହଯୋଗରେ ଏଠାରେ ଶୁଭ୍ର ‘ବିଶ୍ୱ ଶାନ୍ତି ସ୍ତୂପ’ ନିର୍ମିତ ହେଲା।',
    odiaLegendSummary:
      'ଜନଶ୍ରୁତି ଅନୁସାରେ କଳିଙ୍ଗ ଯୁଦ୍ଧରେ ଅସଂଖ୍ୟ ସୈନିକଙ୍କ ରକ୍ତରେ ଦୟା ନଦୀର ଜଳ ଲାଲ୍ ହୋଇଯାଇଥିଲା। ରଣଭୂମିରେ ଜଣେ ବୌଦ୍ଧ ଭିକ୍ଷୁ ଓ ଶୋକସନ୍ତପ୍ତ କଳିଙ୍ଗ ମାତାମାନଙ୍କ ଧୈର୍ଯ୍ୟ ଦେଖି ବିଜୟୀ ସମ୍ରାଟ ଅଶୋକ ତରବାରୀ ତ୍ୟାଗ କରି ‘ଭେରୀଘୋଷ’ ବଦଳରେ ‘ଧର୍ମଘୋଷ’ ଗ୍ରହଣ କଲେ।',
    odiaArchitectureSummary:
      'ଧଉଳିରେ ତଳେ ମୌର୍ଯ୍ୟକାଳୀନ ଜୀବନ୍ତ ପ୍ରସ୍ତର ହସ୍ତୀ ଓ ତିନି ସ୍ତମ୍ଭ ବିଶିଷ୍ଟ ବ୍ରାହ୍ମୀ ଅନୁଶାସନ, ପାହାଡ଼ ଉପରେ ୮୨୯ ଖ୍ରୀଷ୍ଟାବ୍ଦର ଭୌମକର ଗୁମ୍ଫା ଲେଖ ଓ ଧବଳେଶ୍ୱର ମନ୍ଦିର ଏବଂ ଶିଖରରେ ୧୯୭୨ର ଗୋଲାକାର ଶ୍ୱେତ ଶାନ୍ତି ସ୍ତୂପ ଶୋଭା ପାଉଛି।',
    hindiHistorySummary:
      'ईसा पूर्व 261 में दया नदी के मैदान में लड़े गए ऐतिहासिक कलिंग युद्ध में स्वतंत्रता-प्रेमी कलिंगवासियों के सर्वोच्च बलिदान ने मगध सम्राट चंडाशोक के हृदय को झकझोर कर उन्हें ‘धर्माशोक’ बना दिया। धौली पहाड़ी की चट्टान पर ईसा पूर्व 256 में उत्कीर्ण अशोक के ब्राह्मी शिलालेख और ‘शैल-हस्ती’ अहिंसा का प्रथम वैश्विक दस्तावेज़ हैं। 1972 में फूजी गुरुजी के सहयोग से यहाँ श्वेत ‘विश्व शांति स्तूप’ निर्मित हुआ।',
    hindiLegendSummary:
      'लोकस्मृति और बौद्ध परंपरा के अनुसार कलिंग युद्ध के भीषण नरसंहार से दया नदी का जल लाल हो गया था। रणभूमि के करुण दृश्य और बौद्ध भिक्षु उपगुप्त के उपदेश ने सम्राट अशोक को शस्त्र त्यागने पर प्रेरित किया और ‘भेरीघोष’ का स्थान ‘धम्मघोष’ ने लिया।',
    hindiArchitectureSummary:
      'धौली में नीचे मौर्यकालीन एकाश्म हाथी और तीन स्तंभों वाला ब्राह्मी शिलालेख, पहाड़ी पर 829 ईस्वी का भौमकर कालीन गुफा अभिलेख व धवलेश्वर शिव मंदिर, तथा शिखर पर 1972 का भव्य अर्धगोलाकार शांति स्तूप उत्कीर्ण हैं।'
  },
  'story-khandagiri-udayagiri': {
    id: 'story-khandagiri-udayagiri',
    coordinatesLabel: '20.2631° N, 85.7856° E (Kumari & Kumara Twin Hills, Bhubaneswar)',
    elevationMeters: 65,
    riverBasin: 'Kuakhai-Gangua Upland Sandstone Escarpment west of Sisupalgarh',
    primaryStonePetrology:
      'Coarse-to-medium grained Athgarh Gondwana yellowish-buff sandstone ideal for deep rock-cut relief excavation',
    architecturalOrder:
      '1st-Century BCE Chedi Rock-Cut Jaina Lena (single-celled & double-storeyed pillared verandas with bench-beds, rock-cut water cisterns, and narrative friezes) crowned by 19th-century Digambara Jaina Shikharji shrine',
    structuralDimensions:
      '33 protected rock-cut caves total (18 on Udayagiri, 15 on Khandagiri); Rani Gumpha two-storeyed courtyard theatre spanning 92 ft frontage; Hathigumpha natural cavern bearing 17-line, 73-foot-wide Kharavela Prasasti',
    excavationChronology:
      'First documented by Andrew Stirling (1825); Hathigumpha inscription facsimiles studied by Prinsep, Bhagwanlal Indraji (1885), and K.P. Jayaswal & R.D. Banerji (1929–30); Somavamshi 11th-century Tirthankara relief additions',
    epigraphicCorpus:
      '17-line Brahmi Prakrit Hathigumpha Inscription of Kalinga Chakravarti Kharavela (chronicle of his first 13 regnal years, opening with Jaina Namokar Mantra); Chief Queen’s Cave inscription at Mancapuri; Uddyotakesari’s inscriptions in Navamuni & Lalatendu Keshari caves',
    dynasticSequence:
      'Mahameghavahana (Chedi) Dynasty (Emperor Kharavela, Queen Sindhula, Kudepasiri — 1st century BCE) -> Somavamshi Jaina revival under Uddyotakesari (11th century CE) -> 19th-century Digambara Jaina crest temple',
    tradeAndGuildNetwork:
      'Patronized by Kalinga’s royal guild councils (Paura-Janapada), stone-cutters, musicians, and maritime merchants celebrated in Kharavela’s canal-extension projects bringing the Tanasuliya canal into Kalinganagara',
    sacredCalendarAndFestivals:
      'Magha Saptami / Khandagiri Kumbha Mela (9-day ascetic congregation culminating at Guptaganga cave spring), Mahavir Jayanti & Paryushana Digambara Jaina pilgrimages',
    conservationMilestones:
      'ASI rock-bolt consolidation, rainwater drip-channel cutting above Hathigumpha and Rani Gumpha friezes, salt-efflorescence poulticing, and photogrammetric archiving',
    odiaHistorySummary:
      'ଖ୍ରୀଷ୍ଟପୂର୍ବ ପ୍ରଥମ ଶତାବ୍ଦୀରେ ଚେଦି ମହାମେଘବାହନ ବଂଶର କଳିଙ୍ଗ ଚକ୍ରବର୍ତ୍ତୀ ସମ୍ରାଟ ଖାରବେଳ ଜୈନ ଶ୍ରମଣମାନଙ୍କ ସାଧନା ପାଇଁ ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରିରେ ମନୋରମ ପଥର-କଟା ଗୁମ୍ଫା ନିର୍ମାଣ କରିଥିଲେ। ‘ହାତୀଗୁମ୍ଫା’ର ୧୭ ଧାଡ଼ି ବିଶିଷ୍ଟ ବ୍ରାହ୍ମୀ-ପ୍ରାକୃତ ଶିଳାଲେଖ ଖାରବେଳଙ୍କ ୧୩ ବର୍ଷର ଦିଗ୍‌ବିଜୟ, ମଗଧରୁ କଳିଙ୍ଗ ଜିନ ମୂର୍ତ୍ତି ପ୍ରତ୍ୟାବର୍ତ୍ତନ ଓ ଜନକଲ୍ୟାଣର ଜୀବନ୍ତ ଇତିହାସ ବର୍ଣ୍ଣନା କରେ।',
    odiaLegendSummary:
      'ପୌରାଣିକ ଲୋକକଥା ଅନୁସାରେ ହନୁମାନ ସଞ୍ଜୀବନୀ ପର୍ବତ ନେଉଥିବା ସମୟରେ ଏଠାରେ ପର୍ବତର ଏକ ଖଣ୍ଡ ରଖିଥିଲେ। ରାଣୀଗୁମ୍ଫାର ଦ୍ୱିତଳ ପ୍ରାଚୀରରେ ଖୋଦିତ ନୃତ୍ୟ-ସଙ୍ଗୀତ ଉତ୍ସବ ସମ୍ରାଟ ଖାରବେଳଙ୍କ କଳାପ୍ରେମ ଓ ଉତ୍ସବମୁଖର କଳିଙ୍ଗ ନଗରୀର କାହାଣୀ କୁହେ।',
    odiaArchitectureSummary:
      'ଅଠଗଡ଼ ବାଲିପଥର କାଟି ନିର୍ମିତ ରାଣୀଗୁମ୍ଫା, ଗଣେଶ ଗୁମ୍ଫା, ବାଘ ଗୁମ୍ଫା, ଅନନ୍ତ ଗୁମ୍ଫା ଓ ବାରଭୁଜୀ ଗୁମ୍ଫା ପ୍ରାଚୀନ ଭାରତୀୟ ଶୈଳ-ସ୍ଥାପତ୍ୟର ଉତ୍କୃଷ୍ଟ ନିଦର୍ଶନ। ବର୍ଷାଜଳ ନିଷ୍କାସନ ନାଳ, ପଥର ତକିଆ ଭଳି ଢାଲୁ ଶଯ୍ୟା ଓ ରାଣୀଗୁମ୍ଫାର ପ୍ରାକୃତିକ ଶବ୍ଦ-ପ୍ରତିଧ୍ୱନି ଅନନ୍ୟ।',
    hindiHistorySummary:
      'ईसा पूर्व प्रथम शताब्दी में चेदि महामेघवाहन वंश के कलिंग चक्रवर्ती सम्राट खारवेल ने जैन मुनियों के ध्यान हेतु उदयगिरि की 18 तथा खंडगिरि की 15 गुफाओं का निर्माण कराया। ‘हाथीगुम्फा’ का 17 पंक्तियों वाला ब्राह्मी-प्राकृत शिलालेख सम्राट खारवेल के तेरह वर्षों के विजय अभियानों, कलिंग जिन प्रतिमा की वापसी और नहर निर्माण का क्रमिक इतिहास प्रस्तुत करता है।',
    hindiLegendSummary:
      'लोकपरंपरा के अनुसार संजीवनी पर्वत ले जाते समय हनुमान जी द्वारा रखे गए पाषाण खंडों से इन पहाड़ियों का निर्माण हुआ। दो मंजिला ‘रानी गुम्फा’ की भित्तियों पर उत्कीर्ण शास्त्रीय नृत्य और वाद्यवृंद कलिंग समाज की कलाप्रियता दर्शाते हैं।',
    hindiArchitectureSummary:
      'अठगढ़ बलुआ पत्थर को काटकर बनाई गई रानी गुम्फा, गणेश गुम्फा, व्याघ्र गुम्फा, अनंत गुम्फा और चौबीस तीर्थंकरों से सुशोभित बारभुजी गुम्फा भारतीय शैलकृत वास्तुकला के शिखर हैं, जिनमें ढलानदार पाषाण शय्याएं व जल-निकासी नालियां बनी हैं।'
  },
  'story-lingaraj': {
    id: 'story-lingaraj',
    coordinatesLabel: '20.2382° N, 85.8338° E (Ekamra Kshetra Core, Old Town Bhubaneswar)',
    elevationMeters: 45,
    riverBasin: 'Gangua-Gandhabati Sacred Stream & Bindusagar Spring-Fed Reservoir',
    primaryStonePetrology:
      'Deep ferruginous dark-ochre Ekamra sandstone for the 180-foot Deula & Jagamohana; polished black Muguni Chlorite for Parsvadevatas (8-ft Ganesha, Kartikeya, Parvati) and Swayambhu granite-linga',
    architecturalOrder:
      'Canonical Mature Four-Hall Pancharatha Kalinga Rekha Deula (Deula, Jagamohana, Natamandira, Bhogamandapa) enclosed within a 520 × 465 ft laterite compound containing 108 subsidiary shrines',
    structuralDimensions:
      '180 ft (55 m) Rekha Vimana with 7.5-ft thick walls; pyramidal 100-ft Pidha Jagamohana; crowning Dadhinauti, Kalasha, and Pinaka-Bow-Trident finial symbolizing Hari-Hara; adjacent Bindusagar tank 1,300 × 700 ft',
    excavationChronology:
      'Initiated by Somavamshi kings Yayati II & completed by Uddyotakesari (c. 1040–1065 CE); Natamandira & Bhogamandapa added by Eastern Ganga kings (12th–13th century); Ekamra Kshetra Heritage Project & ASI conservation',
    epigraphicCorpus:
      'Lingaraj Jagamohana & Jamb inscriptions of Rajaraja II (1172 CE), Anantavarman Chodaganga Deva (1114 CE), Anangabhima Deva III, and Gajapati Kapilendra Deva',
    dynasticSequence:
      'Somavamshi (Keshari) Dynasty (10th–11th century CE) -> Imperial Eastern Gangas (Vaishnava Hari-Hara synthesis) -> Suryavamsi Gajapatis -> Bhoi Kings of Khurda',
    tradeAndGuildNetwork:
      'Ekamra Kshetra urban temple economy integrating Badu (tribal Sabara-origin water & flower servitors), Pujapanda, Brahmanas, bronze bell-metal casters, and Bindusagar flower cultivators',
    sacredCalendarAndFestivals:
      'Maha Shivaratri (Jagar Yatra — Mahadeepa raised atop the 180-foot spire at 10 PM), Ashokashtami Rukuna Ratha Yatra (Analeuta chariot), Chandan Yatra on Bindusagar',
    conservationMilestones:
      'ASI structural grouting of subsidiary shrines, restoration of Bindusagar’s laterite embankments, and UNESCO Tentative List dossier for Ekamra Kshetra',
    odiaHistorySummary:
      'ଏକାଦଶ ଶତାବ୍ଦୀରେ ସୋମବଂଶୀ ସମ୍ରାଟ ଯଯାତି କେଶରୀ ଦ୍ୱିତୀୟ ଓ ଉଦ୍ୟୋତକେଶରୀଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ୧୮୦ ଫୁଟ ଉଚ୍ଚ ଶ୍ରୀ ଲିଙ୍ଗରାଜ ମନ୍ଦିର ଏକାମ୍ର କ୍ଷେତ୍ର ଭୁବନେଶ୍ୱରର ମୁକୁଟମଣି। ଗଙ୍ଗ ସମ୍ରାଟମାନେ ଏହାର ନାଟମନ୍ଦିର ଓ ଭୋଗମଣ୍ଡପ ସଂଯୋଗ କରି ଶୈବ ଓ ବୈଷ୍ଣବ ଧର୍ମର ମିଳନ ଘଟାଇଥିଲେ, ଯେଉଁଥିପାଇଁ ମହାପ୍ରଭୁ ଏଠାରେ ‘ହରି-ହର’ ଭାବେ ପୂଜିତ ହୁଅନ୍ତି।',
    odiaLegendSummary:
      'ଏକାମ୍ର ପୁରାଣ ଅନୁସାରେ ଏହି ଆମ୍ବବନରେ ମାତା ପାର୍ବତୀ କୀର୍ତ୍ତି ଓ ବାସ ଅସୁରଙ୍କୁ ବଧ କରିଥିଲେ ଏବଂ ପାର୍ବତୀଙ୍କ ତୃଷ୍ଣା ମେଣ୍ଟାଇବା ପାଇଁ ଶିବ ସମସ୍ତ ତୀର୍ଥଜଳ ଆଣି ‘ବିନ୍ଦୁସାଗର’ ସୃଷ୍ଟି କରିଥିଲେ। ଆଦିବାସୀ ବଂଶୋଦ୍ଭବ ‘ବଡ଼ୁ’ ସେବାୟତମାନେ ପ୍ରଭୁଙ୍କର ସ୍ନାନ ଓ ପୁଷ୍ପ ସେବା କରନ୍ତି।',
    odiaArchitectureSummary:
      '୫୨୦ × ୪୬୫ ଫୁଟ ପ୍ରାଚୀର ମଧ୍ୟରେ ୧୦୮ ଦେଉଳ ଘେରରେ ଥିବା ଲିଙ୍ଗରାଜ ମନ୍ଦିର ବିମାନ, ଜଗମୋହନ, ନାଟମନ୍ଦିର ଓ ଭୋଗମଣ୍ଡପର ପୂର୍ଣ୍ଣାଙ୍ଗ ରୂପ ଏବଂ ପାର୍ଶ୍ୱଦେବତା ଭାବେ ୮ ଫୁଟ ଉଚ୍ଚ କଳା ମୁଗୁନି ଗଣେଶ, କାର୍ତ୍ତିକେୟ ଓ ପାର୍ବତୀ ବିରାଜମାନ।',
    hindiHistorySummary:
      'ग्यारहवीं शताब्दी में सोमवंशी सम्राट ययाति द्वितीय और उद्योतकेसरी द्वारा निर्मित 180 फीट ऊंचा श्री लिंगराज मंदिर एकाम्र क्षेत्र भुवनेश्वर का मुकुटमणि है। पूर्वी गंग सम्राटों ने इसमें नाटमंदिर तथा भोगमंडप जोड़कर शैव एवं वैष्णव उपासना का समन्वय किया, जिससे यहाँ स्वयंभू शिवलिंग की पूजा ‘हरि-हर’ रूप में होती है।',
    hindiLegendSummary:
      'एकाम्र पुराण के अनुसार इस आम्र-वन में माँ पार्वती ने कीर्ति और वास दैत्यों का संहार किया था और शिव ने त्रिशूल से समस्त पवित्र नदियों की बूंदों को एकत्र कर ‘बिंदुसागर’ सरोवर प्रकट किया। यहाँ बेलपत्र के साथ तुलसी दल भी अर्पित होता है।',
    hindiArchitectureSummary:
      '520 × 465 फीट के प्रांगण में सौ से अधिक सहायक देवालयों के मध्य स्थित लिंगराज मंदिर कलिंग स्थापत्य के चारों अंगों का सर्वोच्च आदर्श है, जिसके बाहरी ताखों में काले क्लोराइट की आठ फीट ऊंची गणेश, कार्तिकेय और पार्वती प्रतिमाएं उत्कीर्ण हैं।'
  },
  'story-cuttack-barabati': {
    id: 'story-cuttack-barabati',
    coordinatesLabel: '20.4835° N, 85.8655° E (Mahanadi–Kathajodi Deltaic Bifurcation, Cuttack)',
    elevationMeters: 24,
    riverBasin: 'Apex of the Mahanadi-Kathajodi River Delta (Markata Keshari Stone Revetment)',
    primaryStonePetrology:
      'Dressed iron-hard Laterite blocks & Khondalite ashlar masonry bound with lime-surkhi mortar along a 20-yard-wide alligator moat and 989 CE stepped Kathajodi stone embankment',
    architecturalOrder:
      'Medieval Kalinga Riverine Citadel (Abhinava Varanasi Kataka), Nine-Storeyed Palace of Mukunda Deva, Indo-Islamic Qadam-i-Rasool Shrine (1715 CE), and Dhabaleswar Island Temple',
    structuralDimensions:
      '102-acre rectangular fortress ringed by a 60-ft wide moat (Gadakhai); historical 9-storeyed royal palace documented by Abul Fazl; 9-kilometer stone river embankment',
    excavationChronology:
      'Founded c. 989 CE by Markata Keshari; imperial Eastern Ganga capital from 1135 CE; ASI excavations (1989–2008) unearthing 13th-century khondalite palace pillars, white temple plinth, and Chinese celadon porcelain',
    epigraphicCorpus:
      'Nagari Copper Plates of Anangabhima Deva III issued from Abhinava Varanasi Kataka (1230 CE); Persian slab inscriptions at Qadam-i-Rasool (1715 CE); 1803 siege dispatches',
    dynasticSequence:
      'Somavamshi Foundation (989 CE) -> Imperial Eastern Gangas -> Suryavamsi Gajapatis -> Chalukya Gajapati Mukunda Deva (r. 1559–1568 CE) -> Mughal & Maratha Rule -> Modern Odisha Capital until 1948',
    tradeAndGuildNetwork:
      'Millennium-old Baliyatra maritime fair at Gadagadia Ghat; Cuttack Tarakasi (500-year-old Silver Filigree craft awarded GI Tag in 2024); Netaji Subhas Chandra Bose’s birthplace at Odia Bazar',
    sacredCalendarAndFestivals:
      'Historic Cuttack Baliyatra on Kartika Purnima, Cuttack Chandi & Silver-Medha Dussehra Brotherhood, Bada Osha at Dhabaleswar Island',
    conservationMilestones:
      'ASI conservation of the 13th-century Ganga palace pillar base and arched elephant gateway; GI Tag certification of Cuttack Rupa Tarakasi (2024)',
    odiaHistorySummary:
      '୯୮୯ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ କେଶରୀ ରାଜା ମର୍କଟ କେଶରୀ ମହାନଦୀ ଓ କାଠଯୋଡ଼ି ନଦୀର ବନ୍ୟାରୁ ରକ୍ଷା ପାଇଁ ବିଶାଳ ପଥର ବନ୍ଧ ନିର୍ମାଣ କରି କଟକ (‘ଅଭିନବ ବାରାଣସୀ କଟକ’) ପ୍ରତିଷ୍ଠା କରିଥିଲେ। ଗଙ୍ଗ ସମ୍ରାଟ, ସୂର୍ଯ୍ୟବଂଶୀ ଗଜପତି ଓ ମୁକୁନ୍ଦ ଦେବଙ୍କ ନଅ ମହଲା ବିଶିଷ୍ଟ ‘ବାରବାଟୀ ଦୁର୍ଗ’ ୭୦୦ ବର୍ଷ ଧରି ଓଡ଼ିଶାର ରାଜଧାନୀ ଥିଲା।',
    odiaLegendSummary:
      'ଆଇନ୍-ଇ-ଆକବରୀରେ ଆବୁଲ ଫଜଲ ବାରବାଟୀର ୯ ମହଲା ପ୍ରାସାଦର ପ୍ରଶଂସା କରିଛନ୍ତି। କଟକର ଗଡ଼ଗଡ଼ିଆ ଘାଟରୁ ପ୍ରାଚୀନ ଓଡ଼ିଆ ସାଧବ ପୁଅମାନେ କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମାରେ ବାଲି ଓ ଜାଭାକୁ ବୋଇତ ନେଇ ଯାତ୍ରା କରୁଥିଲେ, ଯାହାର ସ୍ମୃତିରେ ‘ବାଲିଯାତ୍ରା’ ଅନୁଷ୍ଠିତ ହୁଏ।',
    odiaArchitectureSummary:
      '୧୦୨ ଏକର ପରିମିତ ବାରବାଟୀ ଦୁର୍ଗ ଚାରିପାଖରେ ୬୦ ଫୁଟ ଚଉଡ଼ା ଗଡ଼ଖାଇ, ମାଙ୍କଡ଼ା ପଥର ପ୍ରାଚୀର, ହାତୀ ପ୍ରବେଶ ତୋରଣ ଏବଂ ୩୨-ସ୍ତମ୍ଭ ପ୍ରାସାଦ ଭିତ୍ତିଭୂମି ରହିଛି। ଏହାସହ ୧୭୧୫ର କଦମ-ଇ-ରସୁଲ ଓ ଜି.ଆଇ. ମାନ୍ୟତାପ୍ରାପ୍ତ ‘ରୂପା ତାରକସି’ ବିଶ୍ୱବିଖ୍ୟାତ।',
    hindiHistorySummary:
      '989 ईस्वी में राजा मर्कट केसरी ने महानदी और काठजोड़ी की बाढ़ रोकने हेतु पाषाण तटबंध बनवाकर ऐतिहासिक नगरी कटक की नींव रखी। सम्राट अनंगभीम देव और मुकुंद देव का नौ-मंजिला ‘बाराबती दुर्ग’ सात शताब्दियों तक ओडिशा की सत्ता का केंद्र रहा तथा यही कटक नेताजी सुभाष चंद्र बोस की जन्मभूमि है।',
    hindiLegendSummary:
      'अबुल फजल ने ‘आइन-ए-अकबरी’ में बाराबती के नौ-मंजिला महल का वर्णन किया है। कार्तिक पूर्णिमा पर महानदी तट से कलिंग के नाविक बाली और जावा की समुद्री यात्रा पर निकलते थे, जिसकी स्मृति में ‘कटक बालीयात्रा’ लगती है।',
    hindiArchitectureSummary:
      '102 एकर में फैले बाराबती किले के चारों ओर 60 फीट चौड़ी खाई, लैटेराइट प्राचीर, भव्य प्रवेश द्वार, 1715 ईस्वी का कदम-ए-रसूल और जीआई-टैग प्राप्त कटक की ‘चांदी तारकशी’ कला की मिसाल हैं।'
  },
  'story-diamond-triangle': {
    id: 'story-diamond-triangle',
    coordinatesLabel: '20.6433° N, 86.3361° E (Birupa–Kelua–Gobari Hills, Jajpur & Cuttack)',
    elevationMeters: 85,
    riverBasin: 'Birupa, Brahmani & Gobari Riverine Corridor connecting Jajpur to Dhamra',
    primaryStonePetrology:
      'Lustrous blue-green Chlorite schist (Ratnagiri Monastery 1 portal), fine Khondalite (colossal Buddha heads, Chaityagriha apsidal stupa, Tara & Vajrapani icons), and kiln-fired monastic brick',
    architecturalOrder:
      'Theravada-Mahayana-Vajrayana Monastic Universities (Mahaviharas): Lalitgiri Apsidal Chaityagriha & Relic Stupa, Ratnagiri Twin Quadrangular Viharas, and Udayagiri Madhavapura & Simhaprastha Mahaviharas',
    structuralDimensions:
      'Lalitgiri apsidal Chaitya hall 22 × 11.4 m; Ratnagiri Monastery-1 courtyard 54.8 × 54.8 m surrounded by 24 monk cells & hundreds of monolithic votive stupas; Udayagiri stepped stone well',
    excavationChronology:
      'Ratnagiri excavated by Debala Mitra (1958–1961); Lalitgiri relic-casket discovery by G.C. Chauley (1985—yielding quadruple nested khondalite-steatite-silver-gold caskets holding sacred bone relic Dhatu); Udayagiri excavated 1985–2003',
    epigraphicCorpus:
      'Terracotta monastic sealings reading Sri Ratnagiri Mahavihariya Arya Bhikshu Sanghasya, Sri Chandraditya Vihara (Lalitgiri), and Sri Madhavapura Mahavihara (Udayagiri); Pratityasamutpada Sutra tablets',
    dynasticSequence:
      'Post-Mauryan stupa phase -> Gupta-era Narasimhagupta Baladitya -> Bhauma-Kara Buddhist Sovereigns (Subhakaradeva I sent signed Gandavyuha manuscript to Tang Emperor Dezong in 795 CE) -> Somavamshi continuance',
    tradeAndGuildNetwork:
      'International Vajrayana & Kalachakra Tantra academy visited by Xuanzang, Prajnasri, Naropa, and Prajna linking Odisha’s ports with Nalanda, Sri Lanka, Java, and Tang China',
    sacredCalendarAndFestivals:
      'Buddha Jayanti / Vesak Purnima International Peace Conclave at Lalitgiri Relic Museum & International Buddhist Heritage Conclave',
    conservationMilestones:
      'ASI Site Museums at Ratnagiri and Lalitgiri housing the quadruple Gold-Silver-Steatite-Khondalite Sacred Relic Casket, and structural anastylosis of Udayagiri Maha Stupa',
    odiaHistorySummary:
      'ଯାଜପୁର ଓ କଟକ ସୀମାର ରତ୍ନଗିରି, ଉଦୟଗିରି ଓ ଲଳିତଗିରି ବିଶ୍ୱରେ ଓଡ଼ିଶାର ‘ବୌଦ୍ଧ ହୀରକ ତ୍ରିଭୁଜ’ ନାମରେ ପ୍ରସିଦ୍ଧ। ଖ୍ରୀଷ୍ଟପୂର୍ବ ଦ୍ୱିତୀୟ ଶତାବ୍ଦୀରୁ ଦ୍ୱାଦଶ ଶତାବ୍ଦୀ ପର୍ଯ୍ୟନ୍ତ ଏଠାରେ ଥେରବାଦ, ମହାଯାନ ଓ ବଜ୍ରଯାନ ତନ୍ତ୍ରର ବିଶ୍ୱବିଦ୍ୟାଳୟ ଥିଲା। ୧୯୮୫ରେ ଲଳିତଗିରିରୁ ସୁନା ପେଡ଼ି ଭିତରୁ ଭଗବାନ ବୁଦ୍ଧଙ୍କ ପବିତ୍ର ଅସ୍ଥି-ଧାତୁ ଆବିଷ୍କୃତ ହୋଇଥିଲା।',
    odiaLegendSummary:
      'ତିବ୍ବତୀୟ ଗ୍ରନ୍ଥ ଅନୁସାରେ ରତ୍ନଗିରି ମହାବିହାରରେ ଆଚାର୍ଯ୍ୟ ପୀତୋପା ଓ ନାରୋପା କାଳଚକ୍ର ତନ୍ତ୍ର ଶିକ୍ଷା ଦେଉଥିଲେ। ୭୯୫ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ ଭୌମକର ସମ୍ରାଟ ଶୁଭକରଦେବ ସ୍ୱହସ୍ତ-ଲିଖିତ ‘ଗଣ୍ଡବ୍ୟୂହ’ ଗ୍ରନ୍ଥ ଚୀନ୍‌ର ତାଙ୍ଗ ସମ୍ରାଟଙ୍କୁ ଉପହାର ପଠାଇଥିଲେ।',
    odiaArchitectureSummary:
      'ଲଳିତଗିରିର ଅର୍ଦ୍ଧ-ବୃତ୍ତାକାର ‘ଚୈତ୍ୟଗୃହ’, ରତ୍ନଗିରି ବିହାର-୧ର ନୀଳ-ସବୁଜ କ୍ଲୋରାଇଟ୍ ପ୍ରବେଶ ଦ୍ୱାର, ବିଶାଳ ବୁଦ୍ଧ ମସ୍ତକ, ତାରା ମୂର୍ତ୍ତି ଏବଂ ଉଦୟଗିରିର ମହାସ୍ତୂପ ଓ ପାହାଚ କୂଅ କଳିଙ୍ଗ ବୌଦ୍ଧ ଶିଳ୍ପକଳାର ଶ୍ରେଷ୍ଠ ନିଦର୍ଶନ।',
    hindiHistorySummary:
      'जाजपुर और कटक की सीमा पर स्थित रत्नगिरि, उदयगिरि और ललितगिरि ओडिशा के ‘बौद्ध हीरक त्रिभुज’ (डायमंड ट्रायंगल) कहलाते हैं। यहाँ थेरवाद, महायान और वज्रयान-कालचक्र तंत्र के महान विश्वविद्यालय रहे तथा 1985 में ललितगिरि महास्तूप से सोने की मंजूषा के भीतर भगवान बुद्ध के पवित्र अस्थि-अवशेष प्राप्त हुए।',
    hindiLegendSummary:
      'तिब्बती इतिहासकार तारानाथ के अनुसार रत्नगिरि महाविहार में आचार्य पिटोपा और नारोपा ने साधना की तथा 795 ईस्वी में भौमकर सम्राट शुभकरदेव ने चीन के तांग सम्राट को ‘गंडव्यूह’ पांडुलिपि भेंट भेजी थी।',
    hindiArchitectureSummary:
      'ललितगिरि का गजपृष्ठाकार चैत्यगृह, रत्नगिरि महाविहार-1 का नील-हरित क्लोराइट पत्थर का तराशा द्वार, विशाल शांत बुद्ध शीर्ष और उदयगिरि का महास्तूप बौद्ध स्थापत्य की अमूल्य धरोहर हैं।'
  }
};
