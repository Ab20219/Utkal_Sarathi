import re

file_path = r"C:\Users\abhis\Downloads\UtkalSarathi-main\UtkalSarathi-main\src\utils\utkalKathaVoiceEngine.ts"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

target_start = "export function answerGeneralOdishaAssistantMultilingual(query: string, lang: VoiceLang = 'en'): string {"
idx = code.find(target_start)
if idx == -1:
    print("Target start not found!")
    exit(1)

new_code = '''export function answerGeneralOdishaAssistantMultilingual(query: string, lang: VoiceLang = 'en'): string {
  const activeLang = detectQueryLanguage(query, lang);
  const q = query.toLowerCase();

  const isSafety =
    /sos|police|emergency|help|safe|hospital|helpline|control\\s*room|ସୁରକ୍ଷା|ପୋଲିସ|ଜରୁରୀ|ସହାୟତା|ଡାକ୍ତରଖାନା|सुरक्षा|पुलिस|आपातकाल|हेल्पलाइन|अस्पताल|मदद/.test(
      q
    );
  const isTransit =
    /bus|train|cab|auto|fare|price|airport|mo\\s*bus|route|ବସ୍|ଟ୍ରେନ୍|ଭଡ଼ା|ଯାତାୟାତ|ରୁଟ୍|बस|ट्रेन|किराया|ऑटो|एयरपोर्ट|मार्ग/.test(
      q
    );
  const isFood =
    /food|cuisine|pakhala|rasagola|chhena\\s*poda|magji|mudhi\\s*mansa|kai\\s*chutney|coffee|craft|handloom|sweet|gi\\s*tag|ମିଠା|ଜିଆଇ|ଖାଦ୍ୟ|ପଖାଳ|ରସଗୋଲା|ଛେନାପୋଡ଼|ମଗଜି|ମୁଢ଼ି|କାଈ|କଫି|ଭୋଜନ|भोजन|व्यंजन|पखाल|रसगुल्ला|छेनापोड़|मगजी|मुढ़ी|कॉफ़ी|मिठाई|जीआई/.test(
      q
    );
  const isInscriptions =
    /inscri|epigraph|edict|hatigumpha|kharavela|brahmi|ashoka\\s*rock|baya\\s*chakada|ଶିଳାଲେଖ|ଅଭିଲେଖ|ହାତୀଗୁମ୍ଫା|ଖାରବେଳ|ବ୍ରାହ୍ମୀ|शिलालेख|अभिलेख|हाथीगुम्फा|खारवेल|ब्राह्मी/.test(
      q
    );

  // 1. High-priority transit and fare queries (prevents 'Puri Mo Bus' from returning temple history)
  if (isTransit) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶା ଯାତାୟାତ ଓ ମୋ ବସ୍ ସରକାରୀ ଭଡ଼ା ସୂଚନା:\\n\\n' +
        '• ରୁଟ୍ ୫୦ (ଭୁବନେଶ୍ୱର ରେଳ ଷ୍ଟେସନ୍ରୁ ପୁରୀ): ଶୀତତାପ ନିୟନ୍ତ୍ରିତ (ଏସି) ଭଡ଼ା ₹୭୦, ଅଣ-ଏସି ₹୫୦ (ପ୍ରତି ୨୦ ମିନିଟରେ ଉପଲବ୍ଧ)।\\n' +
        '• ରୁଟ୍ ୭୦ (ଭୁବନେଶ୍ୱର ବିମାନବନ୍ଦରରୁ କୋଣାର୍କ): ଶୀତତାପ ନିୟନ୍ତ୍ରିତ ଭଡ଼ା ₹୭୦।\\n' +
        '• କଟକ-ଭୁବନେଶ୍ୱର ରୁଟ୍: ଭଡ଼ା ₹୩୦ ରୁ ₹୪୫।\\n' +
        '• ଟ୍ୟାକ୍ସି ବେଞ୍ଚମାର୍କ: ଭୁବନେଶ୍ୱରରୁ ପୁରୀ କିମ୍ବା କୋଣାର୍କ ପ୍ରାୟ ₹୧୪୦୦ ରୁ ₹୧୮୦୦। ବିମାନବନ୍ଦର ଓ ଷ୍ଟେସନ୍ରେ ପ୍ରି-ପେଇଡ୍ ଅଟୋ/ଟ୍ୟାକ୍ସି କାଉଣ୍ଟର ଉପଲବ୍ଧ। ସମସ୍ତ ୩୦ ଜିଲ୍ଲାର ବସ୍-ଟ୍ରେନ୍ ବିବରଣୀ ପାଇଁ ଆପ୍‌ର ‘ଯାତାୟାତ ଓ ଭଡ଼ା’ ବିଭାଗ ଦେଖନ୍ତୁ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा परिवहन व ‘मो बस’ (Mo Bus) सरकारी किराया विवरण:\\n\\n' +
        '• रूट 50 (भुवनेश्वर रेलवे स्टेशन से पुरी): वातानुकूलित (एसी) किराया ₹70, नॉन-एसी ₹50 (प्रत्येक 20 मिनट पर उपलब्ध)।\\n' +
        '• रूट 70 (भुवनेश्वर एयरपोर्ट से कोणार्क): एसी किराया ₹70।\\n' +
        '• कटक-भुवनेश्वर रूट: किराया ₹30 से ₹45।\\n' +
        '• टैक्सी मानक: भुवनेश्वर से पुरी अथवा कोणार्क लगभग ₹1400 से ₹1800। एयरपोर्ट व स्टेशन पर प्री-पेड ऑटो/टैक्सी बूथ उपलब्ध हैं। विस्तृत दरों हेतु ऐप का ‘ट्रांजिट व किराया’ टैब देखें।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha Transit & CRUT Mo Bus Official Route & Fare Guide:\\n\\n' +
      '• Route 50 (Bhubaneswar Railway Station to Puri via NH-316): AC fare ₹70, Non-AC ₹50 (runs every 20 mins).\\n' +
      '• Route 70 (Bhubaneswar Airport to Konark via Pipili): AC fare ₹70.\\n' +
      '• Cuttack - Bhubaneswar inter-city routes: Fare ₹30–₹45.\\n' +
      '• Taxi/Cab Benchmark: Bhubaneswar to Puri/Konark approx ₹1,400–₹1,800. Auto-rickshaw prepaid booths available at airport and stations. Check the Transit & Fares tab for complete route matrices.'
    );
  }

  // 2. High-priority emergency safety and hospital queries
  if (isSafety) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଉତ୍କଳ ସୁରକ୍ଷା ଜରୁରୀକାଳୀନ ସହାୟତା ଓ ହେଲ୍ପଲାଇନ୍:\\n\\n' +
        '• ଜାତୀୟ ଜରୁରୀ ସେବା (ERSS): ୧୧୨ (ପୋଲିସ, ଆମ୍ବୁଲାନ୍ସ ଓ ଅଗ୍ନିଶମ)\\n' +
        '• ଓଡ଼ିଶା ପର୍ଯ୍ୟଟନ ୨୪x୭ ହେଲ୍ପଲାଇନ୍: ୧୮୦୦-୨୦୮-୧୪୧୪\\n' +
        '• ମହିଳା ସୁରକ୍ଷା ହେଲ୍ପଲାଇନ୍: ୧୮୧ | ସାଇବର ଅପରାଧ: ୧୯୩୦\\n' +
        '• ଆପ୍‌ର ‘ଉତ୍କଳ ସୁରକ୍ଷା’ ବିଭାଗରୁ ଆପଣ ଗୋଟିଏ କ୍ଲିକ୍ରେ ନିଜର ଲାଇଭ୍ ଜିପିଏସ୍ କୋଅର୍ଡିନେଟ୍ସ କପି କରି ପରିବାର କିମ୍ବା ପୋଲିସକୁ ପଠାଇପାରିବେ ଏବଂ ସମସ୍ତ ୩୦ ଜିଲ୍ଲାର ମୁଖ୍ୟ ଡାକ୍ତରଖାନା ନମ୍ବର ପାଇପାରିବେ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! उत्कल सुरक्षा आपातकालीन सहायता व हेल्पलाइन:\\n\\n' +
        '• राष्ट्रीय आपात सेवा (ERSS): 112 (पुलिस, एम्बुलेंस व अग्निशमन)\\n' +
        '• ओडिशा पर्यटन 24x7 हेल्पलाइन: 1800-208-1414\\n' +
        '• महिला सुरक्षा हेल्पलाइन: 181 | साइबर अपराध: 1930\\n' +
        '• ऐप के ‘उत्कल सुरक्षा’ टैब से आप एक क्लिक में अपना लाइव जीपीएस लोकेशन कॉपी कर पुलिस या परिजनों को भेज सकते हैं और सभी 30 ज़िलों के मुख्य सरकारी अस्पताल व कंट्रोल रूम नंबर देख सकते हैं।',
        'hi'
      );
    }
    return (
      'UtkalSuraksha Emergency Support & Helplines:\\n\\n' +
      '• National Emergency Response (ERSS): 112 (Police, Ambulance, Fire)\\n' +
      '• Odisha Tourism 24x7 Helpline: 1800-208-1414\\n' +
      '• Women Safety Helpline: 181 | Cyber Crime: 1930\\n' +
      '• The UtkalSuraksha tab provides direct contact numbers for District Headquarters Hospitals (DHH) and Police Control Rooms across all 30 districts, with one-tap live GPS coordinates sharing.'
    );
  }

  // 3. High-priority GI tags and iconic regional cuisine queries
  if (isFood && !findDistrict(query)) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶାର ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟ:\\n\\n' +
        '• ଢେଙ୍କାନାଳ ମଗଜି (Dhenkanal Magji): ମଇଁଷି କ୍ଷୀର ଛେନାରୁ ପ୍ରସ୍ତୁତ ଢେଙ୍କାନାଳର ପ୍ରସିଦ୍ଧ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା।\\n' +
        '• ନୟାଗଡ଼ ଛେନାପୋଡ଼ (Nayagarh Chhena Poda): ଶାଳପତ୍ରରେ ଗୁଡ଼ାଇ ପୋଡ଼ା ଯାଇଥିବା ଭାରତର ଅନନ୍ୟ ବେକ୍ଡ୍ ମିଠା (ଜିଆଇ ଟ୍ୟାଗ୍)।\\n' +
        '• ଓଡ଼ିଶା ରସଗୋଲା: ଶତାବ୍ଦୀ ଶତାବ୍ଦୀ ଧରି ରଥଯାତ୍ରା ନୀଳାଦ୍ରି ବିଜେରେ ମହାପ୍ରଭୁ ଶ୍ରୀଜଗନ୍ନାଥଙ୍କୁ ସମର୍ପିତ ସ୍ୱାଦିଷ୍ଟ ରସଗୋଲା (ଜିଆଇ ଟ୍ୟାଗ୍)।\\n' +
        '• ମୟୂରଭଞ୍ଜ ମୁଢ଼ି ମାଂସ ଓ କାଈ ଚଟଣୀ: ଶିମିଳିପାଳ ଜଙ୍ଗଲର ଲାଲ୍ ପିମ୍ପୁଡ଼ିରୁ ପ୍ରସ୍ତୁତ ପୁଷ୍ଟିକର କାଈ ଚଟଣୀ (ଜିଆଇ ଟ୍ୟାଗ୍) ଓ ଖାସି ମାଂସ ମୁଢ଼ି।\\n' +
        '• କୋରାପୁଟ ଜୈବିକ କଫି: ପୂର୍ବଘାଟ ପର୍ବତମାଳାରେ ଆଦିବାସୀ ଚାଷୀଙ୍କ ଦ୍ୱାରା ଉତ୍ପାଦିତ ଉଚ୍ଚ ମାନର ଜୈବିକ କଫି।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा के विश्वप्रसिद्ध जीआई टैग मिष्ठान व पारंपरिक व्यंजन:\\n\\n' +
        '• ढेंकानाल मगजी (Dhenkanal Magji): भैंस के दूध के ताज़ा छेने से निर्मित ढेंकानाल की प्रसिद्ध जीआई-टैग प्राप्त मिठाई।\\n' +
        '• नयागढ़ छेना पोड़ (Nayagarh Chhena Poda): साल के पत्तों में लपेटकर धीमी आंच पर पकाई गई भारत की अनूठी मिठाई (जीआई टैग)।\\n' +
        '• ओडिशा रसगुल्ला: रथयात्रा नीलाद्रि बिजे पर महाप्रभु जगन्नाथ को अर्पित सदियों पुराना रसीला मिष्ठान (जीआई टैग)।\\n' +
        '• मयूरभंज मुढ़ी मांसा व काई चटनी: मयूरभंज का मटन मुढ़ी तथा शिमिलिपाल की लाल बुनकर चींटियों से निर्मित पौष्टिक काई चटनी (जीआई टैग)।\\n' +
        '• कोरापुट जैविक कॉफ़ी: पूर्वी घाट के आदिवासियों द्वारा उगाई जाने वाली उच्च गुणवत्ता वाली ऑर्गेनिक अरेबिका कॉफ़ी।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha GI Tag Delicacies & Culinary Heritage:\\n\\n' +
      '• Dhenkanal Magji: Certified GI Tag sweet crafted from condensed buffalo milk chhena, unique to Dhenkanal.\\n' +
      '• Nayagarh Chhena Poda: The legendary caramelized baked cottage cheese sweet slow-cooked in sal leaves (GI Tag).\\n' +
      '• Odisha Rasagola: Authentic soft, brown-tinted sweet with centuries of Jagannath temple Niladri Bije ritual tradition (GI Tag).\\n' +
      '• Mayurbhanj Mudhi Mansa & Kai Chutney: Traditional puffed rice with mutton, and Similipal’s red weaver ant Kai Chutney (GI Tag).\\n' +
      '• Koraput Organic Coffee: High-altitude shade-grown Arabica coffee cultivated by tribal farmers in Koraput hills (GI Tag).'
    );
  }

  // 4. Master Inscriptions and Epigraphy queries (Konark, Dhauli, Kharavela Hathigumpha)
  if (isInscriptions) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶାର ପ୍ରମୁଖ ତିନୋଟି ଐତିହାସିକ ଶିଳାଲେଖ ଓ ପୋଥି ପ୍ରମାଣ:\\n\\n' +
        '୧. ଖାରବେଳଙ୍କ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ (ଉଦୟଗିରି, ଭୁବନେଶ୍ୱର): ଖ୍ରୀଷ୍ଟପୂର୍ବ ପ୍ରଥମ ଶତାବ୍ଦୀର ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ୧୭ ଧାଡ଼ି ବିଶିଷ୍ଟ ବ୍ରାହ୍ମୀ ଲିପି ଓ ପ୍ରାକୃତ ଭାଷାର ଶିଳାଲେଖ, ଯେଉଁଥିରେ ‘ଭାରତବର୍ଷ’ ନାମର ସର୍ବପ୍ରଥମ ପ୍ରାମାଣିକ ଉଲ୍ଲେଖ ରହିଛି।\\n' +
        '୨. ସମ୍ରାଟ ଅଶୋକଙ୍କ ଧଉଳି ଶିଳାଲେଖ: ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ର କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ଅଶୋକଙ୍କ କଳିଙ୍ଗ ଶିଳାଲେଖ, ଯେଉଁଥିରେ ସେ ଘୋଷଣା କରିଥିଲେ: ‘ସବେ ମୁନିସେ ପଜା ମମା’ (ସମସ୍ତ ମଣିଷ ମୋର ସନ୍ତାନ)।\\n' +
        '୩. କୋଣାର୍କ ବାୟା ଚକଡ଼ା ତାଳପତ୍ର ପୋଥି: ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହଦେବ ଓ ପ୍ରଧାନ ସ୍ଥପତି ବିଶୁ ମହାରଣାଙ୍କ ଦ୍ୱାରା କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ନିର୍ମାଣର ଦୈନିକ ହିସାବ ଓ ବାସ୍ତୁ ବିବରଣୀ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा के प्रमुख तीन ऐतिहासिक शिलालेख व अभिलेख साक्ष्य:\\n\\n' +
        '1. सम्राट खारवेल का हाथीगुम्फा शिलालेख (उदयगिरि, भुवनेश्वर): ईसा पूर्व पहली सदी का महामेघवाहन सम्राट खारवेल का 17 पंक्तियों का ब्राह्मी लिपि व प्राकृत भाषा का शिलालेख, जिसमें ‘भारतवर्ष’ का प्राचीनतम अभिलेखीय उल्लेख मिलता है।\\n' +
        '2. सम्राट अशोक का धौली शिलालेख: 261 ईसा पूर्व कलिंग युद्ध के उपरांत उत्कीर्ण अशोक का विशेष कलिंग शिलालेख, जिसमें अमर संदेश है: ‘सबे मुनिसे पजा ममा’ (सभी मनुष्य मेरी संतान हैं)।\\n' +
        '3. कोणार्क बाया चकड़ा ताड़पत्र पांडुलिपि: राजा लांगुला नरसिंहदेव और मुख्य वास्तुकार बिशु महाराणा द्वारा कोणार्क सूर्य मंदिर निर्माण का प्रामाणिक दैनिक वास्तुशिल्प व लेखा-जोखा अभिलेख।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha Master Epigraphic & Manuscript Chronicles:\\n\\n' +
      '1. Kharavela’s Hathigumpha Inscription (Udayagiri, Bhubaneswar): 17-line Brahmi script, Prakrit inscription from the 1st century BCE by Mahameghavahana Emperor Kharavela, containing the earliest documented epigraphic mention of "Bharatavarsha".\\n' +
      '2. Ashoka’s Dhauli Rock Edicts: Carved following the Kalinga War (261 BCE), where Emperor Ashoka renounced violence and declared: "Savve Munisse Paja Mama" ("All men are my children").\\n' +
      '3. Konark Baya Chakada Palm-Leaf Manuscript: The documented daily architectural logbook and accounts of King Narasimhadeva I and chief architect Bishu Maharana detailing 12 years of temple construction.'
    );
  }

  // 5. Match by Monument (Puri Jagannath, Konark, Dhauli, Lingaraj, etc.)
  const matchedStory = findMatchingHistoricStory(query);
  if (matchedStory) {
    return answerMonumentQuestionMultilingual(query, matchedStory, undefined, activeLang);
  }

  // 6. Match by District (Mayurbhanj, Koraput, Dhenkanal, Sambalpur, etc.)
  const matchedDistrict = findDistrict(query);
  if (matchedDistrict) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        `ନମସ୍କାର! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ଜିଲ୍ଲା ଦର୍ଶନ ଓ ଯାତ୍ରା ସୂଚନା:\\n\\n` +
        `• ମୁଖ୍ୟ ଆକର୍ଷଣ: ${matchedDistrict.highlights.join(', ')}\\n` +
        `• ପ୍ରସିଦ୍ଧ ଖାଦ୍ୟ: ${matchedDistrict.signatureCuisine.join(', ')}\\n` +
        `• ଇକୋ-ଟୁରିଜିମ୍ ଓ ପ୍ରକୃତି: ${matchedDistrict.ecoTourismAndNature.join(', ')}\\n` +
        `• ହସ୍ତତନ୍ତ ଓ ଶିଳ୍ପ: ${matchedDistrict.handicraftsAndArt.join(', ')}\\n` +
        `• ଯାତାୟାତ: ରେଳ: ${matchedDistrict.transportHubs.nearestRail} | ରାଜପଥ: ${matchedDistrict.transportHubs.highway}\\n` +
        `• ସୁରକ୍ଷା ଓ ହସ୍ପିଟାଲ: ${matchedDistrict.safetyAndHelpline.districtHospital} | ପୋଲିସ ନିୟନ୍ତ୍ରଣ କକ୍ଷ: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | ଜରୁରୀକାଳୀନ: ୧୧୨।`,
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        `नमस्ते! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ज़िला यात्रा विवरण:\\n\\n` +
        `• प्रमुख दर्शनीय स्थल: ${matchedDistrict.highlights.join(', ')}\\n` +
        `• प्रसिद्ध खानपान: ${matchedDistrict.signatureCuisine.join(', ')}\\n` +
        `• ईको-टूरिज्म व प्रकृति: ${matchedDistrict.ecoTourismAndNature.join(', ')}\\n` +
        `• हस्तशिल्प व संस्कृति: ${matchedDistrict.handicraftsAndArt.join(', ')}\\n` +
        `• परिवहन: निकटतम रेलवे: ${matchedDistrict.transportHubs.nearestRail} | राजमार्ग: ${matchedDistrict.transportHubs.highway}\\n` +
        `• सुरक्षा व चिकित्सा: ${matchedDistrict.safetyAndHelpline.districtHospital} | पुलिस कंट्रोल रूम: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | आपातकाल: 112।`,
        'hi'
      );
    }
    return (
      `Greetings! Travel guide for ${matchedDistrict.name} (${matchedDistrict.odiaName}, HQ: ${matchedDistrict.headquarters}):\\n\\n` +
      `• Top Attractions: ${matchedDistrict.highlights.join(', ')}\\n` +
      `• Signature Cuisine: ${matchedDistrict.signatureCuisine.join(', ')}\\n` +
      `• Eco-Tourism: ${matchedDistrict.ecoTourismAndNature.join(', ')}\\n` +
      `• Crafts & Handloom: ${matchedDistrict.handicraftsAndArt.join(', ')}\\n` +
      `• Transit: Rail: ${matchedDistrict.transportHubs.nearestRail} | Highway: ${matchedDistrict.transportHubs.highway}\\n` +
      `• Hospital & Emergency: ${matchedDistrict.safetyAndHelpline.districtHospital} | Police Control: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | SOS: 112.`
    );
  }

  // 7. General Multilingual Welcoming Assistant Fallback
  if (activeLang === 'or') {
    return ensurePureIndicProse(
      'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ‘ଉତ୍କଳ ମିତ୍ର’—ଆପଣଙ୍କର ଓଡ଼ିଆ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଆପଣ ମତେ ଓଡ଼ିଶାର ୨୫ଟି ଐତିହାସିକ ସ୍ଥାନ (କୋଣାର୍କ, ଶ୍ରୀମନ୍ଦିର, ଧଉଳି, ଲିଙ୍ଗରାଜ, ଚିଲିକା, ହୀରାକୁଦ, ଶିମିଳିପାଳ), ୩୦ଟି ଜିଲ୍ଲାର ଯାତ୍ରା ଯୋଜନା, ବସ୍-ଟ୍ୟାକ୍ସି ଭଡ଼ା କିମ୍ବା ପର୍ଯ୍ୟଟକ ସୁରକ୍ଷା ବିଷୟରେ ଓଡ଼ିଆରେ ପଚାରିପାରିବେ।',
      'or'
    );
  }

  if (activeLang === 'hi') {
    return ensurePureIndicProse(
      'जय जगन्नाथ! मैं ‘उत्कल मित्र’ हूँ—आपका हिंदी वॉइस असिस्टेंट। आप मुझसे ओडिशा के २५ ऐतिहासिक स्थलों (कोणार्क, पुरी जगन्नाथ, धौली, लिंगराज, चिल्का, हीराकुद, सिमिलिपाल), ३० ज़िलों की यात्रा योजना, किराया या पर्यटक सुरक्षा के बारे में हिंदी में पूछ सकते हैं।',
      'hi'
    );
  }

  return 'Jay Jagannath! I am Utkal Mitra, your multilingual Odisha Heritage & Travel Voice Assistant (English, ଓଡ଼ିଆ, and हिन्दी). Ask me about any of Odisha’s 25 historic monuments, custom itineraries across all 30 districts, fair transit rates, or UtkalSuraksha emergency support.';
}
'''

updated_content = code[:idx] + new_code

with open(file_path, "w", encoding="utf-8") as f:
    f.write(updated_content)

# Also update Utkal-Sarathi-main copy
backup_path = r"C:\Users\abhis\Downloads\Utkal-Sarathi-main\Utkal-Sarathi-main\src\utils\utkalKathaVoiceEngine.ts"
with open(backup_path, "w", encoding="utf-8") as f:
    f.write(updated_content)

print("Both utkalKathaVoiceEngine.ts files successfully updated!")
